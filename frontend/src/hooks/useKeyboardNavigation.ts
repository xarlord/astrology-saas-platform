     1|/**
     2| * useKeyboardNavigation Hook
     3| *
     4| * WCAG 2.1 AA - Keyboard Navigation Utilities
     5| *
     6| * Provides comprehensive keyboard navigation for lists, grids, and interactive elements.
     7| * Supports arrow keys, Home/End, Page Up/Down, and activation keys.
     8| *
     9| * @see https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
    10| */
    11|
    12|import { useCallback, useEffect, useRef, useState } from 'react';
    13|
    14|/**
    15| * Navigation direction types
    16| */
    17|export type NavigationDirection = 'horizontal' | 'vertical' | 'both' | 'grid';
    18|
    19|/**
    20| * Keyboard navigation options
    21| */
    22|export interface UseKeyboardNavigationOptions<T = HTMLElement> {
    23|  /** Items to navigate through */
    24|  items: T[];
    25|  /** Currently selected/focused item index */
    26|  selectedIndex?: number;
    27|  /** Callback when selection changes */
    28|  onSelect?: (index: number, item: T) => void;
    29|  /** Callback when item is activated (Enter/Space) */
    30|  onActivate?: (index: number, item: T) => void;
    31|  /** Callback when Escape is pressed */
    32|  onEscape?: () => void;
    33|  /** Navigation direction */
    34|  direction?: NavigationDirection;
    35|  /** Number of columns for grid navigation */
    36|  columns?: number;
    37|  /** Whether navigation is enabled */
    38|  enabled?: boolean;
    39|  /** Whether to loop around at boundaries */
    40|  loop?: boolean;
    41|  /** Whether to skip disabled items */
    42|  skipDisabled?: boolean;
    43|  /** Function to check if an item is disabled */
    44|  isItemDisabled?: (item: T, index: number) => boolean;
    45|  /** Page size for Page Up/Down */
    46|  pageSize?: number;
    47|  /** Whether to focus the item on selection */
    48|  focusOnSelect?: boolean;
    49|}
    50|
    51|/**
    52| * Return type for useKeyboardNavigation
    53| */
    54|export interface UseKeyboardNavigationReturn {
    55|  /** Currently selected index */
    56|  selectedIndex: number;
    57|  /** Set selected index manually */
    58|  setSelectedIndex: (index: number) => void;
    59|  /** Ref to attach to the container element */
    60|  containerRef: React.RefObject<HTMLElement>;
    61|  /** Props to spread on the container element */
    62|  getContainerProps: (
    63|    props?: React.HTMLAttributes<HTMLElement>,
    64|  ) => React.HTMLAttributes<HTMLElement>;
    65|  /** Props to spread on individual item elements */
    66|  getItemProps: (
    67|    index: number,
    68|    props?: React.HTMLAttributes<HTMLElement>,
    69|  ) => React.HTMLAttributes<HTMLElement>;
    70|  /** Navigate to next item */
    71|  navigateNext: () => void;
    72|  /** Navigate to previous item */
    73|  navigatePrevious: () => void;
    74|  /** Navigate to first item */
    75|  navigateFirst: () => void;
    76|  /** Navigate to last item */
    77|  navigateLast: () => void;
    78|  /** Navigate to page up */
    79|  navigatePageUp: () => void;
    80|  /** Navigate to page down */
    81|  navigatePageDown: () => void;
    82|  /** Activate current item */
    83|  activateCurrent: () => void;
    84|}
    85|
    86|/**
    87| * Custom hook for comprehensive keyboard navigation
    88| */
    89|export function useKeyboardNavigation<T = HTMLElement>(
    90|  options: UseKeyboardNavigationOptions<T>,
    91|): UseKeyboardNavigationReturn {
    92|  const {
    93|    items,
    94|    selectedIndex: controlledSelectedIndex,
    95|    onSelect,
    96|    onActivate,
    97|    onEscape,
    98|    direction = 'vertical',
    99|    columns = 1,
   100|    enabled = true,
   101|    loop = true,
   102|    skipDisabled = true,
   103|    isItemDisabled,
   104|    pageSize = 10,
   105|    focusOnSelect = true,
   106|  } = options;
   107|
   108|  const containerRef = useRef<HTMLElement>(null);
   109|  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0);
   110|  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());
   111|
   112|  // Use controlled or internal state
   113|  const selectedIndex = controlledSelectedIndex ?? internalSelectedIndex;
   114|  const setSelectedIndex = useCallback(
   115|    (index: number) => {
   116|      if (controlledSelectedIndex === undefined) {
   117|        setInternalSelectedIndex(index);
   118|      }
   119|      onSelect?.(index, items[index]);
   120|    },
   121|    [controlledSelectedIndex, onSelect, items],
   122|  );
   123|
   124|  // Check if item is focusable
   125|  const isFocusable = useCallback(
   126|    (index: number): boolean => {
   127|      if (index < 0 || index >= items.length) return false;
   128|      // If skipDisabled is false or there's no isItemDisabled function, all items are focusable
   129|      if (!skipDisabled || !isItemDisabled) return true;
   130|      return !isItemDisabled(items[index], index);
   131|    },
   132|    [items, skipDisabled, isItemDisabled],
   133|  );
   134|
   135|  // Find next focusable index
   136|  const findNextFocusable = useCallback(
   137|    (startIndex: number, direction: 1 | -1): number => {
   138|      // If skipDisabled is false or there's no isItemDisabled function, return startIndex directly
   139|      if (!skipDisabled || !isItemDisabled) return startIndex;
   140|
   141|      let index = startIndex;
   142|      const maxIterations = items.length;
   143|
   144|      for (let i = 0; i < maxIterations; i++) {
   145|        if (isFocusable(index)) return index;
   146|        index = (index + direction + items.length) % items.length;
   147|      }
   148|
   149|      return startIndex;
   150|    },
   151|    [items.length, skipDisabled, isItemDisabled, isFocusable],
   152|  );
   153|
   154|  // Navigate to a specific index
   155|  const navigateTo = useCallback(
   156|    (newIndex: number) => {
   157|      const focusableIndex = findNextFocusable(newIndex, newIndex > selectedIndex ? 1 : -1);
   158|      setSelectedIndex(focusableIndex);
   159|
   160|      if (focusOnSelect) {
   161|        const itemElement = itemRefs.current.get(focusableIndex);
   162|        itemElement?.focus();
   163|      }
   164|    },
   165|    [findNextFocusable, selectedIndex, setSelectedIndex, focusOnSelect],
   166|  );
   167|
   168|  // Navigation functions
   169|  const navigateNext = useCallback(() => {
   170|    let newIndex: number;
   171|
   172|    if (direction === 'horizontal' || direction === 'grid') {
   173|      newIndex = selectedIndex + 1;
   174|      if (!loop && newIndex >= items.length) return;
   175|      newIndex = newIndex % items.length;
   176|    } else {
   177|      newIndex = selectedIndex + 1;
   178|      if (!loop && newIndex >= items.length) return;
   179|      newIndex = newIndex % items.length;
   180|    }
   181|
   182|    navigateTo(newIndex);
   183|  }, [direction, selectedIndex, items.length, loop, navigateTo]);
   184|
   185|  const navigatePrevious = useCallback(() => {
   186|    let newIndex: number;
   187|
   188|    if (direction === 'horizontal' || direction === 'grid') {
   189|      newIndex = selectedIndex - 1;
   190|      if (!loop && newIndex < 0) return;
   191|      newIndex = (newIndex + items.length) % items.length;
   192|    } else {
   193|      newIndex = selectedIndex - 1;
   194|      if (!loop && newIndex < 0) return;
   195|      newIndex = (newIndex + items.length) % items.length;
   196|    }
   197|
   198|    navigateTo(newIndex);
   199|  }, [direction, selectedIndex, items.length, loop, navigateTo]);
   200|
   201|  const navigateFirst = useCallback(() => {
   202|    navigateTo(0);
   203|  }, [navigateTo]);
   204|
   205|  const navigateLast = useCallback(() => {
   206|    navigateTo(items.length - 1);
   207|  }, [navigateTo, items.length]);
   208|
   209|  const navigatePageUp = useCallback(() => {
   210|    const newIndex = Math.max(0, selectedIndex - pageSize);
   211|    navigateTo(newIndex);
   212|  }, [selectedIndex, pageSize, navigateTo]);
   213|
   214|  const navigatePageDown = useCallback(() => {
   215|    const newIndex = Math.min(items.length - 1, selectedIndex + pageSize);
   216|    navigateTo(newIndex);
   217|  }, [selectedIndex, pageSize, items.length, navigateTo]);
   218|
   219|  const activateCurrent = useCallback(() => {
   220|    if (isFocusable(selectedIndex)) {
   221|      onActivate?.(selectedIndex, items[selectedIndex]);
   222|    }
   223|  }, [isFocusable, selectedIndex, onActivate, items]);
   224|
   225|  // Grid navigation helper
   226|  const navigateGrid = useCallback(
   227|    (key: string) => {
   228|      const row = Math.floor(selectedIndex / columns);
   229|      const col = selectedIndex % columns;
   230|      let newIndex = selectedIndex;
   231|
   232|      switch (key) {
   233|        case 'ArrowRight':
   234|          if (col < columns - 1 && selectedIndex + 1 < items.length) {
   235|            newIndex = selectedIndex + 1;
   236|          } else if (loop) {
   237|            newIndex = row * columns;
   238|          }
   239|          break;
   240|        case 'ArrowLeft':
   241|          if (col > 0) {
   242|            newIndex = selectedIndex - 1;
   243|          } else if (loop) {
   244|            newIndex = Math.min(row * columns + columns - 1, items.length - 1);
   245|          }
   246|          break;
   247|        case 'ArrowDown':
   248|          if (selectedIndex + columns < items.length) {
   249|            newIndex = selectedIndex + columns;
   250|          } else if (loop) {
   251|            newIndex = col;
   252|          }
   253|          break;
   254|        case 'ArrowUp':
   255|          if (selectedIndex - columns >= 0) {
   256|            newIndex = selectedIndex - columns;
   257|          } else if (loop) {
   258|            newIndex = Math.min(
   259|              items.length - 1 - ((items.length - 1) % columns) + col,
   260|              items.length - 1,
   261|            );
   262|          }
   263|          break;
   264|      }
   265|
   266|      if (newIndex !== selectedIndex) {
   267|        navigateTo(newIndex);
   268|      }
     default:
       break;
   269|    },
   270|    [columns, selectedIndex, items.length, loop, navigateTo],
   271|  );
   272|
   273|  // Keyboard event handler
   274|  const handleKeyDown = useCallback(
   275|    (event: React.KeyboardEvent | KeyboardEvent) => {
   276|      if (!enabled) return;
   277|
   278|      const { key } = event;
   279|
   280|      // Handle grid navigation separately
   281|      if (
   282|        direction === 'grid' &&
   283|        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)
   284|      ) {
   285|        event.preventDefault();
   286|        navigateGrid(key);
   287|        return;
   288|      }
   289|
   290|      switch (key) {
   291|        case 'ArrowDown':
   292|          if (direction === 'vertical' || direction === 'both') {
   293|            event.preventDefault();
   294|            navigateNext();
   295|          }
   296|          break;
   297|        case 'ArrowUp':
   298|          if (direction === 'vertical' || direction === 'both') {
   299|            event.preventDefault();
   300|            navigatePrevious();
   301|          }
   302|          break;
   303|        case 'ArrowRight':
   304|          if (direction === 'horizontal' || direction === 'both') {
   305|            event.preventDefault();
   306|            navigateNext();
   307|          }
   308|          break;
   309|        case 'ArrowLeft':
   310|          if (direction === 'horizontal' || direction === 'both') {
   311|            event.preventDefault();
   312|            navigatePrevious();
   313|          }
   314|          break;
   315|        case 'Home':
   316|          event.preventDefault();
   317|          navigateFirst();
   318|          break;
   319|        case 'End':
   320|          event.preventDefault();
   321|          navigateLast();
   322|          break;
   323|        case 'PageUp':
   324|          event.preventDefault();
   325|          navigatePageUp();
   326|          break;
   327|        case 'PageDown':
   328|          event.preventDefault();
   329|          navigatePageDown();
   330|          break;
   331|        case 'Enter':
   332|        case ' ':
   333|          if (!isItemDisabled?.(items[selectedIndex], selectedIndex)) {
   334|            event.preventDefault();
   335|            activateCurrent();
   336|          }
   337|          break;
   338|        case 'Escape':
   339|          event.preventDefault();
   340|          onEscape?.();
   341|          break;
   342|      }
     default:
       break;
   343|    },
   344|    [
   345|      enabled,
   346|      direction,
   347|      navigateNext,
   348|      navigatePrevious,
   349|      navigateFirst,
   350|      navigateLast,
   351|      navigatePageUp,
   352|      navigatePageDown,
   353|      activateCurrent,
   354|      onEscape,
   355|      isItemDisabled,
   356|      items,
   357|      selectedIndex,
   358|      navigateGrid,
   359|    ],
   360|  );
   361|
   362|  // Container props
   363|  const getContainerProps = useCallback(
   364|    (
   365|      props?: React.HTMLAttributes<HTMLElement> & { ref?: React.RefCallback<HTMLElement> },
   366|    ): React.HTMLAttributes<HTMLElement> & { ref?: React.RefCallback<HTMLElement> } => ({
   367|      ...props,
   368|      ref: containerRef as unknown as React.RefCallback<HTMLElement>,
   369|      onKeyDown: (e) => {
   370|        handleKeyDown(e);
   371|        props?.onKeyDown?.(e);
   372|      },
   373|      role: 'listbox',
   374|      'aria-orientation': direction === 'horizontal' ? 'horizontal' : 'vertical',
   375|      tabIndex: 0,
   376|    }),
   377|    [handleKeyDown, direction],
   378|  );
   379|
   380|  // Item props
   381|  const getItemProps = useCallback(
   382|    (
   383|      index: number,
   384|      props?: React.HTMLAttributes<HTMLElement>,
   385|    ): React.HTMLAttributes<HTMLElement> & { ref?: React.RefCallback<HTMLElement> } => {
   386|      const disabled = isItemDisabled?.(items[index], index);
   387|
   388|      return {
   389|        ...props,
   390|        ref: (el: HTMLElement | null) => {
   391|          if (el) {
   392|            itemRefs.current.set(index, el);
   393|          } else {
   394|            itemRefs.current.delete(index);
   395|          }
   396|        },
   397|        role: 'option',
   398|        tabIndex: index === selectedIndex ? 0 : -1,
   399|        'aria-selected': index === selectedIndex,
   400|        'aria-disabled': disabled,
   401|        onClick: (e) => {
   402|          if (!disabled) {
   403|            navigateTo(index);
   404|            onActivate?.(index, items[index]);
   405|          }
   406|          props?.onClick?.(e);
   407|        },
   408|        onFocus: (e) => {
   409|          if (!disabled) {
   410|            setSelectedIndex(index);
   411|          }
   412|          props?.onFocus?.(e);
   413|        },
   414|      };
   415|    },
   416|    [isItemDisabled, items, selectedIndex, navigateTo, onActivate, setSelectedIndex],
   417|  );
   418|
   419|  // Update item refs when items change
   420|  useEffect(() => {
   421|    // Clean up refs for removed items
   422|    const validIndices = new Set(items.map((_, i) => i));
   423|    itemRefs.current.forEach((_, index) => {
   424|      if (!validIndices.has(index)) {
   425|        itemRefs.current.delete(index);
   426|      }
   427|    });
   428|  }, [items]);
   429|
   430|  return {
   431|    selectedIndex,
   432|    setSelectedIndex: navigateTo,
   433|    containerRef,
   434|    getContainerProps,
   435|    getItemProps,
   436|    navigateNext,
   437|    navigatePrevious,
   438|    navigateFirst,
   439|    navigateLast,
   440|    navigatePageUp,
   441|    navigatePageDown,
   442|    activateCurrent,
   443|  };
   444|}
   445|
   446|/**
   447| * Type-ahead navigation hook for lists
   448| */
   449|export interface UseTypeAheadOptions<T> {
   450|  items: T[];
   451|  getKey?: (item: T) => string;
   452|  onMatch?: (index: number, item: T) => void;
   453|  delay?: number;
   454|}
   455|
   456|export function useTypeAhead<T>(options: UseTypeAheadOptions<T>) {
   457|  const { items, getKey = (item) => String(item), onMatch, delay = 500 } = options;
   458|
   459|  const searchStringRef = useRef('');
   460|  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
   461|
   462|  const handleKeyPress = useCallback(
   463|    (key: string) => {
   464|      // Update ref immediately (synchronous, no stale closure)
   465|      searchStringRef.current = searchStringRef.current + key.toLowerCase();
   466|
   467|      // Clear existing timeout
   468|      if (timeoutRef.current) {
   469|        clearTimeout(timeoutRef.current);
   470|      }
   471|
   472|      // Set new timeout to clear search string
   473|      timeoutRef.current = setTimeout(() => {
   474|        searchStringRef.current = '';
   475|      }, delay);
   476|
   477|      // Find matching item using ref value (always current)
   478|      const matchIndex = items.findIndex((item) =>
   479|        getKey(item).toLowerCase().startsWith(searchStringRef.current),
   480|      );
   481|
   482|      if (matchIndex !== -1) {
   483|        onMatch?.(matchIndex, items[matchIndex]);
   484|      }
   485|    },
   486|    [items, getKey, onMatch, delay],
   487|  );
   488|
   489|  // Return the ref value for display purposes
   490|  const searchString = searchStringRef.current;
   491|
   492|  // Cleanup timeout on unmount
   493|  useEffect(() => {
   494|    return () => {
   495|      if (timeoutRef.current) {
   496|        clearTimeout(timeoutRef.current);
   497|      }
   498|    };
   499|  }, []);
   500|
   501|