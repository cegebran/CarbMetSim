package util;

/* Classes representing a Priority queue. This data structure is
 * particular efficient for adding items to a list and then deleting
 * the item with the smallest cost. 
 */


/* Representation of the Priority queue itself
 */
public class PriQ {
	
	/* Representation of an individual element on a
	 * priority queue.
	 */
	public static class PriQElt {
		private PriQElt left;
	    private PriQElt right;
	    private PriQElt parent;
	    private long dist;
	    
	    protected long cost0;
	    protected long cost1;
	    protected long tie1;
	    protected long tie2;
	    
	    // Default constructor sufficient
	    
		// Cost comparison function
	    public boolean costs_less(PriQElt oqe) {
	    	if (cost0 < oqe.cost0)
	    		return(true);
    	    else if (cost0 > oqe.cost0)
    	    	return(false);
    	    else if (cost1 < oqe.cost1)
    	    	return(true);
    	    else if (cost1 > oqe.cost1)
    	    	return(false);
    	    else if (tie1 > oqe.tie1)
    	    	return(true);
    	    else if (tie1 < oqe.tie1)
    	    	return(false);
    	    else if (tie2 > oqe.tie2)
    	    	return(true);
    	    else return(false);
	    }
	    
	    // XXX: public friend int main(int argc, char *argv[]);  
	}

	private PriQElt root;
	
	// Default constructor sufficient
	
	/* Routines implementing a priority queue. There are two standard
	 * operations. priq_merge() merges two priority queues. Addition
	 * of a single element is a special case of the merge (second priority
	 * queue consisting of a single element). Removing the smallest queue
	 * element (always the head) is also implementing by merging the left
	 * and right children. The second operation is removing a queue element
	 * (not necessarily the head) and is implemented by priq_delete().
	 *
	 * This priority queue leans to the left. Following right pointers
	 * always gets you to NULL is O(log(n) operations. Each queue element
	 * has the following items: left pointer, right pointer, distance to NULL,
	 * and the item's cost. The properties of the queue are:
	 *
	 * 	COST(a) <= COST(LEFT(a)) and COST(a) <= COST(RIGHT(a))
	 * 	DIST(LEFT(a)) >= DIST(RIGHT(a))
	 * 	DIST(a) = 1 + DIST(RIGHT(a))
	 *
	 * It's this last clause that makes the tree lean to the left.
	 * Priority queues are covered in Section 5.2.3 of Knuth Vol. III.
	 */
	
	
	/* Go back up the queue, readjusting the DIST() and
	 * left and right pointers as necessary.
	 * Used by both the priority queue merge and delete routines.
	 */
	private void priq_adjust(PriQElt balance_pt, int deleting) {
		PriQElt left = new PriQElt();
	    PriQElt right = new PriQElt();

	    for (; balance_pt != null ; balance_pt = balance_pt.parent) {
			long new_dist;
			left = balance_pt.left;
			right = balance_pt.right;
			
			if (right == null)
			    new_dist = 1;
			else if (left == null) {
			    balance_pt.left = right;
			    balance_pt.right = null;
			    new_dist = 1;
			} else if (left.dist < right.dist) {
			    balance_pt.left = right;
			    balance_pt.right = left;
			    new_dist = left.dist + 1;
			} else {
			    new_dist = right.dist + 1;
			}
	
			if (new_dist != balance_pt.dist)
			    balance_pt.dist = new_dist;
			else if (deleting != 0) break;
	    }
	}
	
	/* Merge two priority queues. Compare their heads. Assign the smallest
	 * as the new head, and then merge its right subtree with the other
	 * queue. This process then repeats. After reaching NULL (which, since
	 * we're always dealing with right pointers, happens in O(log(n)). Go
	 * back up the tree (which is why we keep parent pointers) adjusting
	 * DIST(a) and flipping left and right when necessary.
	 */
	private void priq_merge(PriQ otherq) {
		PriQElt parent = new PriQElt();
	    PriQElt temp = new PriQElt();
	    PriQElt x = new PriQElt();
	    PriQElt y = new PriQElt();

	    if (otherq.root == null) {
	    	if (root != null) root.parent = null;
	    	return;
	    } else if (root == null) {
	    	root = otherq.root;
	    	if (root != null) root.parent = null;
	    	return;
	    } else {
	    	y = otherq.root;
	    	if (y.costs_less(root)) {
	    		temp = root;
	    		root = y;
	    		y = temp;
	    	}

			// Make sure that root's parent is NULL
			root.parent = null;
	
			// Merge right pointer with other queue
			parent = root;
			x = root.right;
	
			while (x != null) {
			    if (y.costs_less(x)) {
			    	temp = x;
			    	x = y;
			    	y = temp;
			    }
			    x.parent = parent;
			    parent.right = x;
			    parent = x;
			    x = x.right;
			}
	
			parent.right = y;
			y.parent = parent;
			priq_adjust(parent, 0);	// 0 indicates false
		}
	}
	
	public PriQElt priq_gethead() { return root; }
	
	/* Take the top element off the priority queue.
	 * Maintain the priority queue structure by merging
	 * the left and right halves of the tree.
	 */
	public PriQElt priq_rmhead() {
		PriQElt top;
	    PriQ temp1 = new PriQ();
	    PriQ temp2 = new PriQ();

	    if ((top = root) == null) return null;

	    temp1.root = top.left;
	    temp2.root = top.right;
	    temp1.priq_merge(temp2);
	    root = temp1.root;
	    return top;
	}
	
	/* Add an element to a priority queue.
	 */
	public void priq_add(PriQElt item) {
		PriQ temp = new PriQ();
		item.left = null;
	    item.right = null;
	    item.parent = null;
	    item.dist = 1;
	    temp.root = item;
	    priq_merge(temp);
	}
	
	/* Delete an item from the middle of the priority queue. Merge
	 * the two branches leading from the deleted node, and then go back
	 * up the tree, rebalancing when necessary.
	 *
	 * To enable going back up the tree, parent pointers have been added
	 * to the priority queue items.
	 */
	public void priq_delete(PriQElt item) {
		PriQElt parent = new PriQElt();
	    PriQ q1 = new PriQ();
	    PriQ q2 = new PriQ();

	    parent = item.parent;
	    q1.root = item.right;
	    q2.root = item.left;
	    q1.priq_merge(q2);

	    if (parent == null)
	    	root = q1.root;
	    else if (parent.right == item)
	    	parent.right = q1.root; 
	    else
	    	parent.left = q1.root;
	    	
	    if (q1.root != null) q1.root.parent = parent;

	    priq_adjust(parent, 1);	// 1 indicates false
	}
}
